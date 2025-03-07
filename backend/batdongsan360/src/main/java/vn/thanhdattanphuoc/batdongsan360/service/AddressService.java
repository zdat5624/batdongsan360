package vn.thanhdattanphuoc.batdongsan360.service;

import java.util.List;

import org.springframework.stereotype.Service;

import vn.thanhdattanphuoc.batdongsan360.domain.address.District;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Province;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Ward;
import vn.thanhdattanphuoc.batdongsan360.repository.address.DistrictRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.ProvinceRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.WardRepository;

@Service
public class AddressService {

    private final ProvinceRepository provinceRepository;

    private final DistrictRepository districtRepository;

    private final WardRepository wardRepository;

    public AddressService(ProvinceRepository provinceRepository, DistrictRepository districtRepository,
            WardRepository wardRepository) {

        this.provinceRepository = provinceRepository;
        this.districtRepository = districtRepository;
        this.wardRepository = wardRepository;
    }

    public List<Province> getAllProvinces() {
        return provinceRepository.findAll();
    }

    public List<District> getDistrictsByProvince(Long provinceCode) {
        return districtRepository.findByProvinceCode(provinceCode);
    }

    public List<Ward> getWardsByDistrict(Long districtCode) {
        return wardRepository.findByDistrictCode(districtCode);
    }
}
