package vn.thanhdattanphuoc.batdongsan360.service;

import java.util.List;

import org.springframework.stereotype.Service;

import vn.thanhdattanphuoc.batdongsan360.domain.Vip;
import vn.thanhdattanphuoc.batdongsan360.repository.VipRepository;
import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;

@Service
public class VipService {
    private final VipRepository vipRepository;

    public VipService(VipRepository vipRepository) {
        this.vipRepository = vipRepository;
    }

    public List<Vip> getAllVips() {
        return vipRepository.findAll();
    }

    public Vip updateVipPrice(Long vipId, long newPrice) throws IdInvalidException {
        Vip vip = vipRepository.findById(vipId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy gói VIP với ID: " + vipId));

        vip.setPricePerDay(newPrice);
        return vipRepository.save(vip);
    }
}
