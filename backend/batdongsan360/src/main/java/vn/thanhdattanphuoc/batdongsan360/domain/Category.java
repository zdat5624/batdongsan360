package vn.thanhdattanphuoc.batdongsan360.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;

@Getter
@Setter
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(min = 5, max = 100, message = "Tên danh mục phải từ 5 đến 100 ký tự")
    private String name;

    @NotNull(message = "Loại danh mục không được để trống")
    @Enumerated(EnumType.STRING)
    private PostTypeEnum type;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<Post> posts;

    public Category() {
    }

    public Category(String name, PostTypeEnum type) {
        this.name = name;
        this.type = type;
    }

}
